import { useState } from 'react';
import { Navbar, SegmentedControl, Image, createStyles, ScrollArea, useMantineColorScheme, Box, Group, ActionIcon } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { FaSun } from "@react-icons/all-files/fa/FaSun";
import { FaMoon } from  "@react-icons/all-files/fa/FaMoon";
import IconLandscape from './assets/icon/icon-landscape.png'

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');

  return {
    navbar: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },

    title: {
      textTransform: 'uppercase',
      letterSpacing: -0.25,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
          .background,
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        [`& .${icon}`]: {
          color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
      },
    },

    footer: {
      borderTop: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
      paddingTop: theme.spacing.md,
    },
  };
});

const tabs = {
  operate: [
    { link: '', label: 'Notifications' },
  ],
  setup: [
    { link: '', label: 'Orders' },
  ],
};

export function Navigation() {
  const { classes, cx } = useStyles();
  const [section, setSection] = useState<'operate' | 'setup'>('operate');
  const [active, setActive] = useState('Billing');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { height } = useViewportSize()

  const links = tabs[section].map((item) => (
    <a
      className={cx(classes.link, { [classes.linkActive]: item.label === active })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <span>{item.label}</span>
    </a>
  ));

  return (
    <Navbar height={height} width={{ sm: 300 }} p="md" className={classes.navbar}>
      <Navbar.Section>
      <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.lg,
        borderBottom: `1px solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
      })}
    >
      <Group position="apart">
        <Image src={IconLandscape} height={30} width={68} fit="contain" />
        <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
          {colorScheme === 'dark' ? <FaSun /> : <FaMoon />}
        </ActionIcon>
      </Group>
    </Box>
        <SegmentedControl
          value={section}
          onChange={(value: 'operate' | 'setup') => setSection(value)}
          transitionTimingFunction="ease"
          fullWidth
          data={[
            { label: 'Operate', value: 'operate' },
            { label: 'Setup', value: 'setup' },
          ]}
        />
      </Navbar.Section>

      <Navbar.Section grow mt="xl" component={ScrollArea}>
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <span>Logout</span>
        </a>
      </Navbar.Section>
    </Navbar>
  );
}