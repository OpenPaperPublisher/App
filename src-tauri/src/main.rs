#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, sync::Mutex};

use dropbox_sdk::oauth2;

const APPKEY: &str = "z4c46xuhvi38jhh";

#[derive(serde::Serialize)]
struct StringFromErr(String);
impl<E> From<E> for StringFromErr
where
    E: std::error::Error,
{
    fn from(e: E) -> Self {
        Self(format!("{}", e))
    }
}

#[derive(serde::Deserialize, std::fmt::Debug)]
struct Template {
    // Display name for the template. Template names can be up to 256 bytes.
    pub name: String,
    // Description for the template. Template descriptions can be up to 1024 bytes.
    pub description: String,
    // Definitions of the property fields associated with this template. There can be up to 32
    // properties in a single template.
    pub fields: Vec<dropbox_sdk::file_properties::PropertyFieldTemplate>,
}

struct AppInfo {
    template_id: Option<String>,
}

//A state to manage what stage of authentication the user is at as well as store any corresponding data for each
enum AuthState {
    NotAuthenticated,
    AuthInProgress(AuthProgressData),
    Authenticated(AuthInfo),
}

struct AuthProgressData {
    auth_type: dropbox_sdk::oauth2::Oauth2Type, //contains the PKCE randomly generated key
}

struct AuthInfo {
    client: dropbox_sdk::default_client::UserAuthDefaultClient, //used to pass into every API call
}

#[tauri::command]
fn get_auth_url(auth: tauri::State<Mutex<AuthState>>) -> String {
    let auth_type = oauth2::Oauth2Type::PKCE(oauth2::PkceCode::new());

    //Need to store it as a variable for `auth-type` to dereference
    let url = oauth2::AuthorizeUrlBuilder::new(APPKEY, &auth_type)
        .build()
        .as_str()
        .to_string();

    //Update the auth state to now be `in progress`
    *auth.lock().unwrap() = AuthState::AuthInProgress(AuthProgressData { auth_type });
    url
}

//Using the authorization code, complete the authentication process
#[tauri::command]
fn finalize_auth(auth: tauri::State<Mutex<AuthState>>, code: &str) -> Result<(), StringFromErr> {
    let mut lock = auth.lock().unwrap();
    let auth_type = if let AuthState::AuthInProgress(auth_struct) = &*lock {
        &auth_struct.auth_type
    } else {
        return Err(StringFromErr("There was an error accessing the authentication type (OAuth2 not initalized / Auth State incorrect)".to_string()));
    };

    let client = dropbox_sdk::default_client::UserAuthDefaultClient::new(
        oauth2::Authorization::from_auth_code(
            APPKEY.to_string(),
            auth_type.clone(),
            code.to_string(),
            None,
        ),
    );

    //make a test call to ensure the client was built correctly
    dropbox_sdk::files::list_folder(&client, &dropbox_sdk::files::ListFolderArg::new("".into()))??;

    *lock = AuthState::Authenticated(AuthInfo { client });

    Ok(())
}

//Checks the app's registered templates to see if a template exists.
//-If no template exists, it creates a new one
//-If the template exists, it updates it with the most recent `template.json` file configuration
#[tauri::command]
fn upsert_template(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
) -> Result<(), StringFromErr> {
    use dropbox_sdk::file_properties;

    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let templates = file_properties::templates_list_for_user(&info.client)??;

    let file = fs::read_to_string("template.json")?;
    let template: Template = serde_json::from_str(file.as_str())?;
    println!(
        "The list of templates that have been generated: {:?}",
        &templates
    );
    if templates.template_ids.is_empty() {
        //Create the template from the JSON fill
        let arg = file_properties::AddTemplateArg::new(
            template.name,
            template.description,
            template.fields,
        );
        let result = file_properties::templates_add_for_user(&info.client, &arg)??;
        app_info.lock().unwrap().template_id = Some(result.template_id);
    } else {
        //Update the template from the JSON file
        let arg = file_properties::UpdateTemplateArg::new(templates.template_ids[0].clone())
            .with_add_fields(template.fields);
        file_properties::templates_update_for_user(&info.client, &arg)??;
        app_info.lock().unwrap().template_id = Some(templates.template_ids[0].clone());
    }

    Ok(())
}

//Lists the base directory of the user's dropbox
//NOTE: the 'base directory' can actually be changed to be another directory if the user so wished and the feature
#[tauri::command]
fn list_base_dir(
    auth: tauri::State<Mutex<AuthState>>,
) -> Result<Vec<dropbox_sdk::files::Metadata>, StringFromErr> {
    use dropbox_sdk::files;

    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let data = files::list_folder(&info.client, &files::ListFolderArg::new("".into()))??.entries; //This is where the base directory folder could be changed
    Ok(data)
    //NOTE: there might be some other processing we would want to do on the back-end before pushing to front-end
}

// Lists the target directory of the user's dropbox
// NOTE: this could technically make the `list_base_dir` command obsolete by just providing the argument of "" or whatever the user-specified base directory's path is
// list_base_dir command currently left for convienience
#[tauri::command]
fn list_target_dir(
    auth: tauri::State<Mutex<AuthState>>,
    target: String,
) -> Result<Vec<dropbox_sdk::files::Metadata>, StringFromErr> {
    use dropbox_sdk::files;

    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let data = files::list_folder(&info.client, &files::ListFolderArg::new(target))??.entries; //This is where the base directory folder could be changed
    Ok(data)
    //NOTE: there might be some other processing we would want to do on the back-end before pushing to front-end
}

fn main() {
    let context = tauri::generate_context!();

    //TODO: implement a way to tell if the user has been authenticated in the past and thus would not require another verification process (setting the state of auth_state to Authenticated)
    let state = AuthState::NotAuthenticated; //This is taken out of the function because the state could change depending on pre-existing verification
    tauri::Builder::default()
        .menu(if cfg!(target_os = "macos") {
            tauri::Menu::os_default(&context.package_info().name)
        } else {
            tauri::Menu::default()
        })
        .manage(Mutex::new(state))
        .manage(Mutex::new(AppInfo { template_id: None }))
        .invoke_handler(tauri::generate_handler![
            get_auth_url,
            finalize_auth,
            upsert_template,
            list_base_dir,
            list_target_dir,
        ])
        .run(context)
        .expect("error while running tauri application");
}
