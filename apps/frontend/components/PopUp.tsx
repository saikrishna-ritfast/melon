import { IoCloseSharp } from "react-icons/io5";

const Form = ({children , modelOpen , setModelOpen}:{children:React.ReactNode , modelOpen:boolean , setModelOpen:(value:boolean) => void}) => {

  const closePopup = (e : React.MouseEvent<HTMLButtonElement>  )=>{
    e.preventDefault()
    setModelOpen(false)
  }

  return (
    <div className={`w-[400px] backdrop-blur-xl rounded-2xl absolute top-[10%] left-[45%] p-8 border border-gray-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 ${ modelOpen ? "" : "hidden" } `}>
      <div className="flex flex-col gap-5">
        <button type="button" className="float-right text-white absolute right-5 top-4 cursor-pointer hover:cursor-pointer" onClick={closePopup} >
          <IoCloseSharp />
        </button>
        <div className="flex flex-col gap-0.5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Form;