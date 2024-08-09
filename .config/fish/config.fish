if status is-interactive
    # Commands to run in interactive sessions can go here
set PATH /usr/bin:/usr/local/bin
set -g fish_greeting
set -g fish_pager_color_progress $comment
set -g fish_pager_color_prefix $cyan
set -g fish_pager_color_completion $foreground
set -g fish_pager_color_description $comment
set -g fish_pager_color_selected_background --background=$selection
#set hi | fortune | cowsay | lolcat
#set hi | cowsay hi Anik | lolcat
#set hi | figlet -f slant anik | lolcat
end


# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH
