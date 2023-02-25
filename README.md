# ddu-source-github
GitHub objects source for `ddu.vim`

This source collects GitHub objects.

Supported objects:

- `github_pr`: Pull Requests (kind/source)
- `github_issue`: Issues (kind/source)

# Required
* [vim-denops/denops.vim](https://github.com/vim-denops/denops.vim)
* [Shougo/ddu.vim](https://github.com/Shougo/ddu.vim)
* [cli/cli](https://github.com/cli/cli)

# Example
```vim
" Set default kind action.
call ddu#custom#patch_global({
\ 'kindOptions': {
\   'github_pr': {
\     'defaultAction': 'switch',
\   },
\   'github_issue': {
\     'defaultAction': 'view_web',
\   },
\ },
\}

" Use github_pr source.
call ddu#start({'ui': 'ff', 'sources': [{'name': 'github_pr'}]})

" Use github_issue source.
call ddu#start({'ui': 'ff', 'sources': [{'name': 'github_issue'}]})
```
