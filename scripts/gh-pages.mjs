import ghPages from "gh-pages";
import path from "path";
import { projectRoot } from "./rootAddress.mjs";

ghPages.publish(path.join(projectRoot, '_build'));