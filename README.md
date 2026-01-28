<h1 align="center"><img src="./public/icon/128.png" height="128"><br>Select like a Boss</h1>

<p align="center"><strong>Select link's text just like a regular text - Select like a Boss ;)</strong></p>

Select like a Boss is a browser extension that allows you to easily select link text just like regular text, making it easier to copy. With this extension, you can quickly select and copy link text without the hassle of selecting the surrounding elements.

## Get

<a href="https://chrome.google.com/webstore/detail/mbnnmpmcijodolgeejegcijdamonganh" target="_blank"><img src="https://github.com/user-attachments/assets/20a6e44b-fd46-4e6c-8ea6-aad436035753" style='height: 60px;' alt="Avaliable in the Chrome Web Store" /></a>
<a href="https://microsoftedge.microsoft.com/addons/detail/gapbnbmenclgbgngpidomkamcmgmpopm" target="_blank"><img src='https://www.muggli.one/Fichiers/SVG/Edge%20add-on%20badge.svg' alt='Get it from Microsoft (Edge)' style='height: 59px;' /></a>
<a href="https://addons.mozilla.org/firefox/addon/select-like-a-boss" target="_blank"><img src='https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png' alt='Get the add-on for Firefox' style='height: 60px;' /></a>

## Features

<table>
    <tr>
        <td><b>select</b></td>
        <td>↔</td>
        <td>like a regular text</td>
    </tr>
    <tr>
        <td><b>drag</b></td>
        <td>↕</td>
        <td>up or down</td>
    </tr>
</table>

- Seamlessly select link text just like regular text.
- Simplify the process of copying link text.
- Works on all web pages.

*Note: some links can be unselectable*

[Demo Video](https://www.youtube.com/watch?v=yuIxgUed_UA)

## Build

1. Clone this repository and navigate to the cloned directory:

2. Install the required dependencies:

```shell
npm install
```

3. Build the extension:

```shell
npm run build -- [--chrome --firefox]
```

By default, running `npm run build` will generate the extension files in the `build` directory for both Chrome and Firefox.

To generate the files for a specific browser, use the appropriate flag:
- `--chrome` to generate the files for Chrome only.
- `--firefox` to generate the files for Firefox only.

For example, to build the extension only for Chrome, run:

```shell
npm run build -- --chrome
```


## Contributing

Contributions are welcome! If you find a bug or have a suggestion for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MPL-2.0 license. See the [LICENSE](LICENSE) file for details.
