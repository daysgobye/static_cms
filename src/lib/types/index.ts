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
    newFileType: '.md' | '.mdx'
    frontMatterFields: FrontMatterField[]
}