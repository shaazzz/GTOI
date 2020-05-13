import glob from "glob";

export const getDirectories = (src, end = 'yaml') => {
  return new Promise(res=>{
    glob(src + '/**/*.'+end, (err, ans) => res(ans));
  });
};