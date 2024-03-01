import { Box, Button, Group, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";
export const Setup = () => {
  const runningInElectron =
    navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;
  console.log(navigator.userAgent);
  const [serverAddress, setServerAddress] = useLocalStorage({
    key: "serverAddress",
    defaultValue: window.location.hostname + ":" + window.location.port,
  });
  const form = useForm({
    initialValues: {
      serverAddress: serverAddress,
    },

    validate: {
      serverAddress: (value) =>
        value !== null && value.length > 0 ? null : "Invalid address",
    },
  });
  useEffect(() => {
    form.setValues({ serverAddress: serverAddress });
  }, [serverAddress]);
  if (runningInElectron) return <Text>Connect devices to {serverAddress}</Text>;
  return (
    <Box maw={340} mx="auto">
      <form
        onSubmit={form.onSubmit((values) => {
          setServerAddress(values.serverAddress);
          window.location.reload();
        })}
      >
        <TextInput
          withAsterisk
          label="Server Address"
          description="Don't include http:// or https:// in the address, but do include the port number. Example: localhost:80"
          {...form.getInputProps("serverAddress")}
        />
        <Group justify="flex-end" mt="md">
          <Button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Box>
  );
};
