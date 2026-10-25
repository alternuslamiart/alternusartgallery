// Repairs only URL password encoding; never changes a host or credential.
export function encodedDatabaseURL(value) {
  try {return new URL(value).href;} catch { /* An unescaped password delimiter. */ }
  const match=/^(postgres(?:ql)?:\/\/)([^:/]+):(.+)@([^/?#]+)(\/.*)$/s.exec(value||'');
  if(!match)throw new Error('INVALID_URL');
  let password;try{password=decodeURIComponent(match[3]);}catch{password=match[3];}
  return new URL(`${match[1]}${match[2]}:${encodeURIComponent(password)}@${match[4]}${match[5]}`).href;
}
