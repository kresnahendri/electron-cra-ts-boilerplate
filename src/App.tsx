import {ChakraProvider} from "@chakra-ui/react";
import {StrictMode} from "react";

import Routes from "./pages/Routes";

function App() {
  return (
    <ChakraProvider>
      <StrictMode>
        <Routes />
      </StrictMode>
    </ChakraProvider>
  );
}

export default App;
