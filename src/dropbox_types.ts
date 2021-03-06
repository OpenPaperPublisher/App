export interface File {
    '.tag': "file",
    client_modified: string,
    id: string,
    name: string,
    property_groups: Array<PropertyGroup>, //TODO: Determine the type of the property groups (or if it even is an array)
    path_display: string,
    path_lower: string,
    size: number,
}
export interface Folder {
    '.tag': "folder",
    id: string,
    name: string,
    path_display: string,
    path_lower: string,
    property_groups: Array<Template>, //TODO: Determine the type of the property groups (or if it even is an array)
}

export interface Field {
    name: string,
    description: string,
    type: { ".tag": string },
}
export interface Template {
    name: string,
    description: string,
    fields: Array<Field>,
}
export interface Property {
    name: string,
    value: string,
}
export interface PropertyGroup {
    template_id: string,
    fields: Array<Property>
}
export interface OPMproperties {
    author: String,
    publish_date: String,
    status: String,
    categories: String,
    tags: String,
    template: String,
}
