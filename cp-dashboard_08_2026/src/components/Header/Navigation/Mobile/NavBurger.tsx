import { Burger, Drawer, Stack, Text } from '@mantine/core';
import { NavMenu } from './NavMenu';
import styles from './NavBurger.module.css';

export function NavBurger({
  opened,
  setIsOpen,
}: {
  opened: boolean;
  setIsOpen: (opened: boolean) => void;
}) {
  const toggle = () => {
    const menuText = document.getElementById('menuText');
    const menuBurger = document.getElementById('menuBurger');

    if (menuText) {
      menuText.style.display = opened ? 'block' : 'none';
    }
    if (menuBurger) {
      menuBurger.style.display = opened ? 'block' : 'none';
    }

    setIsOpen(!opened);
  };

  return (
    <>
      <Drawer.Root
        opened={opened}
        onClose={() => toggle()}
        size="70%"
        classNames={{ inner: styles.drawerContent }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header className={styles.drawerHeader}>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <NavMenu opened />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      <Stack gap={0} bg="black">
        <Burger
          color="white"
          opened={opened}
          onClick={toggle}
          size="md"
          hiddenFrom="xs"
          id="menuBurger"
          aria-label="Open menu"
        />
        <Text hiddenFrom="xs" id="menuText" className={styles.menuText}>
          MENU
        </Text>
      </Stack>
    </>
  );
}
