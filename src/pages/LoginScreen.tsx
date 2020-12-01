import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import React from "react";
import {FiArrowLeft} from "react-icons/fi";
import {Link} from "react-router-dom";

const LoginScreen = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-alert
    alert("Send login request to API");
  };

  return (
    <Container>
      <Link to="/">
        <Flex mb={6} alignItems="center">
          <FiArrowLeft />
          <Text ml={1}>Back</Text>
        </Flex>
      </Link>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" mb={4}>
          <FormLabel>Email/Username</FormLabel>
          <Input type="text" />
        </FormControl>
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" />
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Login
        </Button>
      </form>
    </Container>
  );
};

export default LoginScreen;
