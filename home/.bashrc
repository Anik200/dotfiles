# .bashrc
# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]𐌏\[\033[01;34m\] \w \[\033[01;32m\]\[\033[01;34m\]\[\033[00m\]❱ ';
export PATH=$PATH:/usr/local/bin
export PATH1=$PATH:/home/anik/.cargo/bin
export TLP=/usr/share/tlp
export BROWSER=/usr/bin/firefox
export PYENV_ROOT="$HOME/.pyenv"
export DATE=date
export PATH=$HOME/.nix-profile/bin:$PATH
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
