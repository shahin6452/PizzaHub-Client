"use client";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="container page-shell"><div className="empty-state"><h2>Something went wrong</h2><p>{error.message||"Please try again."}</p><button className="btn btn-primary" onClick={()=>reset()}>Try again</button></div></main>}
