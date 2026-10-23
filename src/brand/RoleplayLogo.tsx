export function RoleplayLogo({compact=false}:{compact?:boolean}) {
  return <span className="roleplay-brand"><img src="/roleplay-mark.svg" width="34" height="34" alt=""/>{!compact&&<span className="roleplay-wordmark">ROLEPLAY<span>.</span></span>}</span>;
}
