export function getDomain() {
  if(process.env.NODE_ENV === 'local'){
    return 'http://localhost:3000/';
  }else{
    return 'https://staging.zwilt.com/'
  }
}
