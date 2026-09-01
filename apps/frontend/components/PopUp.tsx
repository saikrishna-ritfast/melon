
const Form = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="w-[400px] rounded-2xl border-2 border-transparent bg-[linear-gradient(#212121,#212121)_padding-box,linear-gradient(145deg,transparent_35%,#e81cff,#40c9ff)_border-box] p-8 text-sm text-white box-border flex flex-col gap-5">
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