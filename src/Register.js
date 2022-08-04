import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from './api/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/; // пользовательское регулрное выражение проверить имя пользователя(нач-ся с нижнего или верхнего регистра от3-23символа могут быть строчными или прописными,от4-24 символов)
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/; //регулярное выражение пароля (как минимум 1строчная буква 1прописная1цифра1спец символ от8-24символов)
const REGISTER_URL = '/register';

const Register = () => {
    const userRef = useRef();//ссылка для пользовательского ввода,позволит ус-ть фокус на пользовательский ввод
    const errRef = useRef();//когда компонент загружжается ссылка на ошибку

    const [user, setUser] = useState('');//состояние для пользователького поля
    const [validName, setValidName] = useState(false);//действительное имя 
    const [userFocus, setUserFocus] = useState(false);//фокус пользователя 

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');//для пароля 
    const [validMatch, setValidMatch] = useState(false);//действителен пароль
    const [matchFocus, setMatchFocus] = useState(false);//фокус пароля
//состояние ошибок
    const [errMsg, setErrMsg] = useState('');//если ошибка существует
    const [success, setSuccess] = useState(false);


    //для ус-ки фокуса 
    useEffect(() => {
        userRef.current.focus();
    }, [])//когда компонент заг-ся и ус-вит фокус на этом вводе имени пользователя и ссылаться на этого пользователя


    //к имени пользователя тут проверяю имя пользователя 
    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user])//состояние пользователя в массиве зависимостей

    //уведомление о пароле,есть состояние пароля в массиве зависимостей и регистрирую чтобы увидеть дейсствительно ли 
    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);// подтверждение с помощью совпадения 
    }, [pwd, matchPwd])// пароль и соответсвтвующ пароль

    //сообщение об ошибке 
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])//пользователь каждый раз меняет состояние одной из 3-х частей

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with JS hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            // TODO: remove console.logs before deployment
            console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response))
            setSuccess(true);
            //clear state and controlled inputs
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>Success!</h1>
                    <p>
                        <a href="#">Sign In</a>
                    </p>
                </section>
            ) : (
                <section>
                {/*сообщение об ошибке и ссылка */}
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Регистрация</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">
                            Username:
                            <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />{/*вытягиваю шрифт и какой значок ис-ть  */}
                            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                            aria-invalid={validName ? "false" : "true"}
                            aria-describedby="uidnote"
                            onFocus={() => setUserFocus(true)}// поле пользователя имеет фокус то тру
                            onBlur={() => setUserFocus(false)}//размытие когда покидает поле
                        />
                        <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>{/*истене ли фокус пользователя и существует ли состояние пользователя если оно не пустое,если есть пустое поле не отображую инструкцию жду хотябы 1 символ,а затем если нет допустимого имени если есть действительное имя конечно продолжаю также и скрою инструкцию,если выполнтся требования инструкции показаны в противном случае скорется с экрана с абсолютныой позиции в сss  */}
                            <FontAwesomeIcon icon={faInfoCircle} />
                            от 4 до 24 символов.<br />
                            Должен начинаться с буквы.<br />
                            Допускаются буквы, цифры, символы подчеркивания, дефисы.
                        </p>


                        <label htmlFor="password">
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                            aria-invalid={validPwd ? "false" : "true"} //смотрит на действительны пароль который описала
                            aria-describedby="pwdnote" //пароль описывает направления для поля пароля с арией
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>{/*фокус и размытие чтобы увидеть если нахожусь в этом поле или нет */}
                            <FontAwesomeIcon icon={faInfoCircle} />{/*значок с информацией,есть чёткие указания инструкция    */}
                            от 8 до 24 символов.<br />
                            Должен содержать заглавные и строчные буквы, цифру и специальный символ.<br />
                            Разрешенные специальные символы:<span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>{/*поместила символы  в диапазон и использую атрибут метки aria чтобы прогграмма чтения с экрана могла прочитать описание каждого спец символа  */}
                        </p>

{/*подтверждение пароля почти таже логика значки но разница должно быть действительное совпадение пароля но и совпадающее состояние пароля существовать когда пришла  к отображению красного крестика эта таже логика  */}
                        <label htmlFor="confirm_pwd">
                            Confirm Password:
                            <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby="confirmnote"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Должен соответствовать первому полю ввода пароля.
                        </p>

                        <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>
                    </form>
                    <p>
                    Уже зарегистрирован?<br />
                        <span className="line">
                            {/*put router link here*/}
                            <a href="#">Войти</a>
                        </span>
                    </p>
                </section>
            )}
        </>
    )
}

export default Register;