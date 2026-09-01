
const Form = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="w-[400px] backdrop-blur-xl rounded-2xl absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-8 border border-gray-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-0.5">
        {children}
        </div>
        <button
          className="mt-2 flex w-[40%] items-start justify-center gap-2 self-start rounded-md border border-[#414141] bg-[#313131] px-4 py-3 text-sm font-semibold text-[#717171] transition-colors hover:border-white hover:bg-white active:scale-95"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Form;