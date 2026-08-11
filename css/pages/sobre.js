import { loading } from "./../../js/components/loading.js";
import { updateNavbar } from "./../../js/utils/header-update.js";

async function main(){
  loading.show();

  await updateNavbar();

  loading.hide();
}

main();