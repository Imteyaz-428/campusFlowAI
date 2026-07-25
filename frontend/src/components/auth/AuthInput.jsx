function AuthInput({
    label,
    type = "text",
    placeholder,
    register,
    name,
  }) {
    return (
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {label}
        </label>
  
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
    );
  }
  
  export default AuthInput;