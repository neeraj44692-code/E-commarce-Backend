import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer).content;
};

export default getDataUri;

// import DataURIParser from "datauri/parser.js";
// import path from "path";

// const getDataUri = (file) => {
//   if (!file) return null;

//   const parser = new DataURIParser();
//   const extName = path.extname(file.originalname);

//   return parser.format(extName, file.buffer);
// };

// export default getDataUri;
