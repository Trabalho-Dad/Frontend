import { loading } from "../components/loading.js";
import { updateNavbar } from "../utils/header-update.js";

async function main() {
  loading.show();

  try{
    await updateNavbar();
  } catch{

  } finally{
    loading.hide();
  }
}

main();