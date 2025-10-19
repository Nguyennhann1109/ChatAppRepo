import React, { useState } from 'react';
import axios from '../../api/axios';

export default function NotificationTest(){
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const runTest = async () => {
    setErr(null);
    try{
      const r = await axios.get('/api/notifications/test');
      setMsg(r.data.message);
      console.log('test response', r);
    } catch(e){
      setErr(String(e));
      console.error(e);
    }
  }

  return (
    <div className="p-2">
      <button onClick={runTest} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Test UTF-8</button>
      {msg && <div className="mt-2 text-sm">Response: <strong>{msg}</strong></div>}
      {err && <div className="mt-2 text-sm text-red-600">Error: {err}</div>}
    </div>
  )
}
