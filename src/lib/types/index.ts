export type FrontMatterFieldInput = 'date' |
    'shortText' |
    'longText' |
    'filePath' |
    'array' |
    'bool' |
    'number'
export type FrontMatterField = {
    title: string,
    input: FrontMatterFieldInput
}
export type SettingsFile = {
    // wysiwyg:bool
    // handleFrontmatter:bool
    // websiteUrl:bool

    newFileType: '.md' | '.mdx'
    frontMatterFields: FrontMatterField[]
}