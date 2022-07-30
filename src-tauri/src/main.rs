#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, sync::Mutex};

use dropbox_sdk::oauth2;

const APPKEY: &str = "z4c46xuhvi38jhh";

static TEMPLATE_JSON: &str = include_str!("template.json");

#[derive(serde::Serialize)]
struct StringFromErr(String);
impl<E> From<E> for StringFromErr
where
    E: std::error::Error,
{
    fn from(e: E) -> Self {
        println!("{:?}", e);
        Self(format!("{}", e))
    }
}

#[derive(serde::Deserialize, serde::Serialize, std::fmt::Debug)]
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

#[derive(serde::Serialize)]
struct FileMetadata {
    data: Vec<std::collections::HashMap<String, String>>,
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

    let template: Template = serde_json::from_str(TEMPLATE_JSON)?;
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

// Lists the target directory of the user's dropbox
#[tauri::command]
fn list_target_dir(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
    target: String,
) -> Result<Vec<dropbox_sdk::files::Metadata>, StringFromErr> {
    use dropbox_sdk::file_properties;
    use dropbox_sdk::files;

    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let guard = app_info.lock().unwrap();
    let template_id = guard
        .template_id
        .as_ref()
        .ok_or_else(|| {
            StringFromErr(
                "There was an error accessing the template id (template id not initialized)".into(),
            )
        })?
        .clone();

    let data = files::list_folder(
        &info.client,
        &files::ListFolderArg::new(target).with_include_property_groups(
            file_properties::TemplateFilterBase::FilterSome(vec![template_id]),
        ),
    )??
    .entries; //This is where the base directory folder could be changed
    Ok(data)
    //NOTE: there might be some other processing we would want to do on the back-end before pushing to front-end
}

// Takes in a target and a list of file properties (hopefully matching the schema denoted in template.json) and upserts file properties accordingly
#[tauri::command]
fn set_file_properties(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
    target: String,
    properties: Vec<dropbox_sdk::file_properties::PropertyField>,
) -> Result<(), StringFromErr> {
    use dropbox_sdk::file_properties;
    use dropbox_sdk::files;

    let guard = auth.lock().unwrap();
    let auth_info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let guard = app_info.lock().unwrap();
    let template_id = guard
        .template_id
        .as_ref()
        .ok_or_else(|| {
            StringFromErr(
                "There was an error accessing the template id (template id not initialized)".into(),
            )
        })?
        .clone();

    let file = if let files::Metadata::File(metadata) = files::get_metadata(
        &auth_info.client,
        &files::GetMetadataArg::new(target.clone()).with_include_property_groups(
            file_properties::TemplateFilterBase::FilterSome(vec![template_id.clone()]),
        ),
    )?? {
        metadata
    } else {
        return Err(StringFromErr(
            "Invalid file type (Metadata was not that of File)".into(),
        ));
    };
    // If the file has property groups and there is at least one (assumed to be the OPMTemplate)
    // Instead of updating a pre-existing property group, create a new property group with the assigned values
    match file.property_groups.map(|s| s.is_empty()) {
        Some(true) | None => {
            file_properties::properties_add(
                &auth_info.client,
                &file_properties::AddPropertiesArg::new(
                    target,
                    vec![file_properties::PropertyGroup::new(template_id, properties)],
                ),
            )??;
            return Ok(());
        }
        _ => {}
    }

    //if the file does not have any property groups

    file_properties::properties_update(
        &auth_info.client,
        &file_properties::UpdatePropertiesArg::new(
            target,
            vec![file_properties::PropertyGroupUpdate::new(template_id)
                .with_add_or_update_fields(properties)],
        ),
    )??;

    Ok(())
}

// Exports the target folder to the specified directory
// Lots of subfunctions, but in essence:
//    Lists the files in the directory
//    Calls another request to the api for each to get their metadata (actual api export metadata is insufficient)
//    Exports all the paper documents in the directory as .paper files
//    Uses the metadata to write metadata.json
#[tauri::command]
fn export_folder(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
    export_path: String,
    folder_path: String,
) -> Result<(), StringFromErr> {
    use dropbox_sdk::file_properties;
    use dropbox_sdk::files;
    use std::collections::HashMap;

    let mut file_list: Vec<HashMap<String, String>> = Vec::new();

    let guard = auth.lock().unwrap();
    let auth_info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let guard = app_info.lock().unwrap();
    let template_id = guard
        .template_id
        .as_ref()
        .ok_or_else(|| {
            StringFromErr(
                "There was an error accessing the template id (template id not initialized)".into(),
            )
        })?
        .clone();

    let files = filter_files_in_dir(&auth_info.client, template_id.clone(), folder_path)?;

    for file in files {
        let path = match &file.path_lower {
            Some(file_path) => file_path.clone(),
            None => continue,
        };
        let request_result = files::export(
            &auth_info.client,
            &files::ExportArg::new(path.clone()),
            None,
            None,
        )??;

        let mut body = request_result.body.ok_or_else(|| {
            StringFromErr(
                "There was no body returned in the HTMLRequest (HTMLRequest Error: no body)".into(),
            )
        })?;

        // File metadata from the export is not sufficient and incomplete, so a separate backend call must be done
        let data = if let files::Metadata::File(metadata) = files::get_metadata(
            &auth_info.client,
            &files::GetMetadataArg::new(path).with_include_property_groups(
                file_properties::TemplateFilterBase::FilterSome(vec![template_id.clone()]),
            ),
        )?? {
            metadata
        } else {
            return Err(StringFromErr(
                "Invalid file type (Metadata was not that of File)".into(),
            ));
        };
        let mut file_content: String = String::new();

        body.read_to_string(&mut file_content)?;

        let mut file: HashMap<String, String> = HashMap::new();

        match data.property_groups {
            Some(groups) => {
                if !groups.is_empty() {
                    let properties = &groups[0].fields;
                    for prop in properties {
                        file.insert(prop.name.clone(), prop.value.clone());
                    }
                }
            }
            None => {}
        }

        let path = [&export_path, "/", &data.name].concat();

        file.insert("path".into(), path.clone()); //insert the file's path as a property

        file_list.push(file);

        fs::write(path, file_content)?; //Write the file to the designated folder
    }

    let data = FileMetadata { data: file_list };
    fs::write(
        [&export_path, "\\metadata.json"].concat(),
        serde_json::to_string(&data)?,
    )?; //Write the metadata file

    Ok(())
}

// Lists the target directory's files of the user's dropbox
#[tauri::command]
fn list_files_in_dir(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
    target: String,
) -> Result<Vec<dropbox_sdk::files::FileMetadata>, StringFromErr> {
    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let guard = app_info.lock().unwrap();
    let template_id = guard
        .template_id
        .as_ref()
        .ok_or_else(|| {
            StringFromErr(
                "There was an error accessing the template id (template id not initialized)".into(),
            )
        })?
        .clone();

    let data = filter_files_in_dir(&info.client, template_id, target)?;

    Ok(data)
    //NOTE: there might be some other processing we would want to do on the back-end before pushing to front-end
}

// Lists the target directory of the user's dropbox
#[tauri::command]
fn list_folders_in_dir(
    auth: tauri::State<Mutex<AuthState>>,
    app_info: tauri::State<Mutex<AppInfo>>,
    target: String,
) -> Result<Vec<dropbox_sdk::files::FolderMetadata>, StringFromErr> {
    use dropbox_sdk::file_properties;
    use dropbox_sdk::files;

    let guard = auth.lock().unwrap();
    let info = if let AuthState::Authenticated(info) = &*guard {
        info
    } else {
        return Err(StringFromErr("There was an error accessing the authentication info (AuthInfo not initalized / Auth State incorrect)".into()));
    };

    let guard = app_info.lock().unwrap();
    let template_id = guard
        .template_id
        .as_ref()
        .ok_or_else(|| {
            StringFromErr(
                "There was an error accessing the template id (template id not initialized)".into(),
            )
        })?
        .clone();

    let data = files::list_folder(
        &info.client,
        &files::ListFolderArg::new(target).with_include_property_groups(
            file_properties::TemplateFilterBase::FilterSome(vec![template_id]),
        ),
    )??
    .entries
    .iter()
    .flat_map(|folder| {
        let mut is_folder = None;
        if let files::Metadata::Folder(folder_data) = folder {
            is_folder = Some(folder_data.clone());
        }
        is_folder
    })
    .collect();

    Ok(data)
    //NOTE: there might be some other processing we would want to do on the back-end before pushing to front-end
}

// A helper function for export_folder and list_files_in_dir to use the same filter without having to repeat code
// Filters the result of a folder list to return an array containing only files of the paper document type
fn filter_files_in_dir(
    client: &impl dropbox_sdk::client_trait::UserAuthClient,
    template_id: String,
    target: String,
) -> Result<Vec<dropbox_sdk::files::FileMetadata>, StringFromErr> {
    use dropbox_sdk::file_properties;
    use dropbox_sdk::files;

    let data = files::list_folder(
        client,
        &files::ListFolderArg::new(target).with_include_property_groups(
            file_properties::TemplateFilterBase::FilterSome(vec![template_id]),
        ),
    )??
    .entries
    .iter()
    .flat_map(|file| {
        let mut is_file = None;
        if let files::Metadata::File(file_data) = file {
            if file_data.name.ends_with(".paper") {
                is_file = Some(file_data.clone());
            }
        }
        is_file
    })
    .collect();

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
            set_file_properties,
            list_target_dir,
            list_files_in_dir,
            list_folders_in_dir,
            export_folder,
        ])
        .run(context)
        .expect("error while running tauri application");
}
