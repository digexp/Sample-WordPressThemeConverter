# Script for generating an installable DX Theme from a WordPress Theme

This article lays out instructions for manually creating a custom DX Theme from an existing WordPress theme: [Creating an IBM Digital Experience v8.5 theme from a WordPress theme](https://developer.ibm.com/digexp/docs/docs/themes/creating-an-ibm-digital-experience-v8-5-theme-from-a-wordpress-theme/)

This script will generate all the necessary DX files for you, and bundle them into an installable PAA file. After installation, just strip out the remaining PHP code.

## Instructions
1. Clone repository
2. Enter the root directory of your new repository
3. Run `npm install`
4. Run `node script.js name=**"NAME OF THE NEW DX THEME"** wpRemoteZipPath=**path.to.the.wordpress.theme.zip** wpRootFolder=**name-of-the-root-folder-in-the-wordpress-zip**` (eg: `node script.js name="Twenty Sixteen" wpRemoteZipPath=https://downloads.wordpress.org/theme/twentysixteen.1.1.zip wpRootFolder=twentysixteen`)
5. Read the personalized installation and code update instructions generated in the output/output_*name*.html file
6. Refer to the [full manual instructions](https://developer.ibm.com/digexp/docs/docs/themes/creating-an-ibm-digital-experience-v8-5-theme-from-a-wordpress-theme/) for advanced use cases and trouble-shooting
