import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { logout } from "../api/auth.js"; 
import { updateNavbar } from "../utils/header-update.js";

async function main(){
  try{
    loading.show();

    await updateNavbar();

  } catch (error){

  } finally {
    loading.hide();
  }
}

main()