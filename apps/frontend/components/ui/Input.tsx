
const Input = ({ placeholder  , label}: { placeholder:string , label:string } ) => {
  return (
    <div className="flex flex-col gap-2" >
        <label className="">{label}</label>
        <input 
            type="text"
            className=""
            placeholder = {placeholder}
        />
    </div>
    // <input
    //   type="text"
    //   className="flex h-10 w-full rounded-md border-2 border-[#414141] bg-[#313131] px-3 py-2 text-sm font-semibold text-white outline-none ring-offset-gray-950 placeholder:text-[#a1a1a1] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
    //   placeholder="Enter your name"
    // />
  )
}

export default Input