export async function copyText(value:string):Promise<string>{
  try{await navigator.clipboard.writeText(value);return 'Copied. You can paste it into a message.';}
  catch{return 'Copy is unavailable here. Select the displayed text and copy it manually.';}
}
export async function shareContent(title:string,text:string,url?:string):Promise<string>{
  if(navigator.share){try{await navigator.share({title,text,...(url?{url}:{})});return 'Shared.';}catch(error){if(error instanceof DOMException&&error.name==='AbortError')return 'Sharing cancelled.';}}
  return copyText([title,text,url].filter(Boolean).join('\n'));
}
export function downloadJSON(name:string,value:unknown){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
