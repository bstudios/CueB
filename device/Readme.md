
> Some notes here sourced from [Workshopshed](https://community.element14.com/members-area/personalblogs/b/andy-clark-s-blog/posts/vscode-and-micropython-for-the-pi-pico)

## Installing the firmware

Press and hold the BOOTSEL button on the Wiznet W5500-EVB-Pico, then plug into the USB port of your computer. The device will appear as a USB drive. Copy the [firmware file](https://micropython.org/download/W5500_EVB_PICO/) to the USB drive. The device will reboot and the firmware will be installed. If you then un-plug and replug the Pico Pi it reverts to programming mode.

## Installing Thonny

You sadly have to install Thonny 

Next, copy the entire directory and subdirectory onto the pico using Thonny, and the code will then run on next reboot. 

## Libraries

Libraries are in the libs folder. You can copy them to the Pico using Thonny

- [tinyweb](https://github.com/belyalov/tinyweb)
- [uosc](https://github.com/SpotlightKid/micropython-osc)
- [asyncio](https://github.com/peterhinch/micropython-async)