#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;

use dropbox_sdk::oauth2;

//A state to manage what stage of authentication the user is at as well as store any corresponding data for each
enum AuthState {
    NotAuthenticated,
    AuthInProgress(AuthProgressData),
    Authenticated(AuthInfo),
}

struct AuthProgressData {
    auth_type: dropbox_sdk::oauth2::Oauth2Type,
}

struct AuthInfo {
    client: dropbox_sdk::default_client::UserAuthDefaultClient,
}

#[tauri::command]
fn get_auth_url(auth: tauri::State<Mutex<AuthState>>) -> String {
    let auth_type = oauth2::Oauth2Type::PKCE(oauth2::PkceCode::new());

    //Need to store it as a variable for `auth-type` to dereference
    let url = oauth2::AuthorizeUrlBuilder::new("z4c46xuhvi38jhh", &auth_type)
        .build()
        .as_str()
        .to_string();

    *auth.lock().unwrap() = AuthState::AuthInProgress(AuthProgressData { auth_type });
    url
}

#[tauri::command]
fn finalize_auth(auth: tauri::State<Mutex<AuthState>>, code: &str) {
    println!("auth code: {}", code);

    let auth_type = if let AuthState::AuthInProgress(auth_struct) = &*((auth).lock().unwrap()) {
        auth_struct.auth_type.clone()
    } else {
        panic!("Something went wrong") //TODO: change this such that it just tells the user that something went wrong
    };

    let client = dropbox_sdk::default_client::UserAuthDefaultClient::new(
        oauth2::Authorization::from_auth_code(
            "z4c46xuhvi38jhh".to_string(),
            auth_type,
            code.to_string(),
            None,
        ),
    );

    let result = dropbox_sdk::files::list_folder(
        &client,
        &dropbox_sdk::files::ListFolderArg::new("".to_string()),
    )
    .expect("There was an error querying dropbox")
    .expect("There was an error getting the folders");

    println!("Folder contents: {:?}", result.entries);

    *auth.lock().unwrap() = AuthState::Authenticated(AuthInfo { client });
}

//  dropbox_sdk::default_client::UserAuthDefaultClient::new();

fn main() {
    let context = tauri::generate_context!();
    // let code: oauth2::PkceCode = oauth2::PkceCode::new();

    //TODO: implement a way to tell if the user has been authenticated in the past and thus would not require another verification process (setting the state of auth_state to Authenticated)
    let state = AuthState::NotAuthenticated; //this is taken out of the function to make more sense later
    tauri::Builder::default()
        .menu(if cfg!(target_os = "macos") {
            tauri::Menu::os_default(&context.package_info().name)
        } else {
            tauri::Menu::default()
        })
        .manage(Mutex::new(state))
        .invoke_handler(tauri::generate_handler![get_auth_url, finalize_auth,])
        .run(context)
        .expect("error while running tauri application");
}
