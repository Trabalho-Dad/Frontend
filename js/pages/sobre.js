import { loading } from "../components/loading.js";
import { updateNavbar } from "../utils/header-update.js";
import { showError } from "../utils/error.js";

async function main() {
  loading.show();

  try{
    await updateNavbar();
  } catch (error){
    showError(error);
  } finally{
    loading.hide();
  }
}

main();