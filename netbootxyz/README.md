# Introduction
[NetbootXYZ](https://github.com/netbootxyz/netboot.xyz) is an all-in-one tool for network boot/installation of a variety of operating systems.

I've modified the base installation to include an option to install Omni-managed Talos OS instances. To do this, files are added to the [netbootxyz/config/menus/local](https://github.com/kenlasko/docker-rpi1/tree/main/netbootxyz/config/menus/local) folder. I've added 2 files:
- [menu.ipxe](netbootxyz/config/menus/local/menu.ipxe) replaces the default menu with one that includes Omni as the default option
- [omni_SAMPLE.ipxe](netbootxyz/config/menus/local/omni_SAMPLE.ipxe) installs the latest version of Talos OS. This should be renamed to `omni.ipxe` and should be modified to include your unique Omni join token. The join token can be found on the main Omni page on the right side by clicking on `Copy Kernel Parameters`

For my actual installation, the `omni.ipxe` file is populated via the SOPS [secrets.yaml](/secrets.yaml) file because the join token needs to be encrypted in the repository. The unencrypted file is .gitignored.
