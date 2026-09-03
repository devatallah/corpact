import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';

export default function PasswordInput({ style, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
    const [show, setShow] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <input {...props} type={show ? 'text' : 'password'} style={{ ...style, paddingLeft: 40 }} />
            <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                tabIndex={-1}
                style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    color: 'rgba(10,10,10,.55)',
                    lineHeight: 1,
                }}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}
