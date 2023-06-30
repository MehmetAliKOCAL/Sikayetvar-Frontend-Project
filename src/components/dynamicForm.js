export default function DynamicForm({
  formTitle,
  inputsArray,
  editableData,
  placeholderData,
  submitButtonText,
  submitButtonFunction,
  inputOnChangeFunction,
}) {
  return (
    <form
      onClick={() => {
        event.preventDefault();
      }}
      className='z-10 p-8 max-xs:p-4 w-1/4 relative flex flex-col gap-y-2 bg-white text-black shadow-form xs:rounded-[20px]'
    >
      <h1 className='pl-3 mb-6 w-fit mx-auto text-2xl h-8 flex justify-center items-center font-bold uppercase border-l-6 border-themeColor-lighter text-center'>
        {formTitle}
      </h1>
      {inputsArray.map((input) => {
        return (
          <div
            className='flex flex-col gap-y-1'
            key={input.property}
          >
            <label
              htmlFor={input.property}
              className='text-sm max-xs:text-xs font-medium text-fadedTextColor'
            >
              {input.label}
            </label>
            <input
              id={input.property}
              type={input.type}
              placeholder={placeholderData[input.property] || input.placeholder}
              value={editableData[input.property]}
              onChange={() => {
                inputOnChangeFunction();
              }}
              className='p-4 w-full h-11 flex-shrink-0 rounded-md outline-none text-sm transition-all duration-200 border-1 hover:border-themeColor-lighter focus:border-themeColor border-borderColor placeholder:text-xs placeholder:text-inputPlaceholderColor'
            />
          </div>
        );
      })}
      <button
        onClick={() => {
          submitButtonFunction();
        }}
        type='submit'
        className='py-3 px-16 mt-5 mb-2 text-xs text-white font-medium rounded-md uppercase bg-themeColor transition-all duration-200 hover:bg-themeColor/80 active:scale-95'
      >
        {submitButtonText}
      </button>
    </form>
  );
}
