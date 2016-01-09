# Nerd Notes

## Overview
Render notes written in [markdown format](http://daringfireball.net/projects/markdown/) as simple HTML pages. Provide an index and simple navigation for notes organized in a directory structure.

This project started mostly out of a philosophy for staying proficient with useful skills. The skills in practice here are:

   1. [Git](https://git-scm.com/) version control system.
   2. [Markdown](http://daringfireball.net/projects/markdown/) text-to-HTML conversion tool.
   3. Text editor of your choice. I enjoy using [Vim](http://www.vim.org/).
   4. [Grep](http://www.gnu.org/software/grep/) for searching a directory of text notes.

Markdown is a nice format for text notes because it is readable and looks reasonably nice in raw form but can also be rendered in HTML.  As HTML, you can apply various stylesheets to give your notes any appearance you like.

I use git for my notes directory primarily to synchronize versions of notes from one system to another. If only one system is used, Git still offers revision tracking. In either case, some discipline is required in adding files and committing changes.

## Installation

Once you've cloned this repository, you can install dependencies manually or with npm which will use the `package.json` file.

### Dependencies

* [Node.js](https://nodejs.org) - Because this is a Node.js program.
* [marked](https://github.com/chjj/marked) - Translates the markdown text to HTML.

### Usage

Once installed, you can begin capturing notes as text files in any directory structure you choose. You must add the path to this directory in a `config.json` file (example file provided) in the base directory of this project.

Optionally, you can initialize your notes directory as a git repository and begin tracking and committing your notes.

````
$ cd /path/to/notes
git init
git add .
git commit -m "Initail commit"
````

To render your notes as HTML, start the notes server:

````
node nerdnotes.js
````

You can now navigate to <http://localnost:8030> to view your notes. If you used another port in your `config.json` file, you of course need to point to that address instead of 8030.

### Configuration

An example configuration file is provided called `example-config.json`. Make a copy of this file the base directory of this project called `config.json`. The parameters in this file can be edited to suit your needs. At a minimum, you must edit the `notesPath` value to point to the absolute path of your notes directory. The parameters and their defaults are:

   * "verbose"   : false
      * If `true`, provide verbose output for troubleshooting.
   * "httpPort"  : 8030
      * The network port to listen on for HTTP requests. Note that many systems require admin privileges for this to work on common ports such as port 80.
   * "notesPath" : "/Users/someuser/notes"
      * The absolute path where the notes files and subdirectories are stored.
   * "cssPath"   : "darkstyle.css"
      * The relative path to the CSS to include in each rendered page.

If you are serving notes from one server and the notes are edited from several systems, you might want to schedule a regular git update. I use this crontab line:

````
*/5 * * * * git --work-tree=/Users/someuser/notes --git-dir=/Users/someuser/notes/.git pull origin master -q 2>> ~/log/nerdnotes.log
````

## Tips

* If you use Vim to compose markdown, it is a good idea to make sure you have an up to date syntax file. Tim Pope maintains the files that ship with Vim at <https://github.com/tpope/vim-markdown>. I also find I need to install an updated version of Vim because some systems (e.g. OS X) have pretty old versions.
* If you don't like the solarized color theme of my stylesheets, you can replace the .css files with whatever you like.

## To Do:

   * Add a grep box on index pages that returns links for the results.
   * Add option to provide host address for hrefs to work behind a proxy.
