
const Input = ({ placeholder  , label}: { placeholder:string , label:string } ) => {
  return (
    <div className="flex flex-col gap-2" >
        <label className="">{label}</label>
        <input 
            type="text"
            className="flex h-10 w-full rounded-md border border-gray-600 text-sm font-normal px-2 tracking-wider"
            placeholder = {placeholder}
        />
    </div>
  )
}

export default Input