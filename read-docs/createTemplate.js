import { Dropbox } from "dropbox";
import fetch from "isomorphic-fetch";

const ACCESS_TOKEN = process.env["ACCESS_TOKEN"];

const templateFile = require("./OPMtemplate.json");

//Checks to see if the OPMtemplate exists
//If the template does not exist, it creates a new one
//If it doesn't exist, creates a new one
//Returns the id of either the pre-existing or newly created OPMtemplate (will need to be used later in the actual app)
(async () => {

    const dbx = await new Dropbox({ accessToken: ACCESS_TOKEN, fetch });

    const { result: { template_ids  } } = await dbx.filePropertiesTemplatesListForUser();

    //Loop through each template to see if it has the correct name
    //If none have the correct name, continue the code to create a new template
    for (let i = 0; i < template_ids.length; i++) {
        
        const template_id = template_ids[i];
        const {result : template} = await dbx.filePropertiesTemplatesGetForUser({ template_id });

        if (template.name != "OPMtemplate") continue;
        
        console.log("The template already exists");
        return template_id;
    }

    //Assuming the template could not be found:
    //NOTE: The dropbox object will throw an error if there are too many templates.
    //      Custom handling of this error later may be ideal.
    console.log("Template not found, creating OPMtemplate...");
    let {result : { template_id }} = await dbx.filePropertiesTemplatesAddForUser(templateFile);
    
    console.log("OPMtemplate created");
    return template_id;


})();