import { useState } from 'react';

function PasswordInput({ className, placeholder, value, onChange, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-pw-wrap">
      <input
        className={className}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button type="button" className="auth-pw-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

export default PasswordInput;
