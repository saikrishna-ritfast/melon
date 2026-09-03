
const Input = ({ placeholder  , label , ...props}: { placeholder:string , label:string } ) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-200">{label}</label>}
      <input 
        type="text"
        className={`flex h-10 w-full rounded-md border border-gray-600 text-sm font-normal px-2 tracking-wider`}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;