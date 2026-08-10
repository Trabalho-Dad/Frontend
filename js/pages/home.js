import { loading } from "../components/loading.js";
import { updateNavbar } from "../utils/header-update.js";

async function main() {
  loading.show();
  
  await updateNavbar();

  loading.hide();
}

main();