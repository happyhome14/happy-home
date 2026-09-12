const SUPABASE_URL =
    "https://idcsmnlhjnupvrpenlxx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// KIỂM TRA ĐÃ ĐĂNG NHẬP CHƯA
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        // Nếu đã đăng nhập
        // thì chuyển thẳng vào trang quản trị

        if (session) {

            window.location.href =
                "bookings.html";

            return;

        }


        // ========================================
        // XỬ LÝ FORM ĐĂNG NHẬP
        // ========================================

        const loginForm =
            document.getElementById(
                "adminLoginForm"
            );


        if (!loginForm) return;


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "adminEmail"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "adminPassword"
                    ).value;


                const errorBox =
                    document.getElementById(
                        "adminLoginError"
                    );


                errorBox.style.display =
                    "none";


                // ========================================
                // ĐĂNG NHẬP SUPABASE AUTH
                // ========================================

                const {
                    data,
                    error
                } = await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


                // ========================================
                // ĐĂNG NHẬP THẤT BẠI
                // ========================================

                if (error) {

                    console.error(
                        "Lỗi đăng nhập:",
                        error
                    );


                    errorBox.textContent =
                        "Email hoặc mật khẩu không đúng.";

                    errorBox.style.display =
                        "block";

                    return;

                }


                // ========================================
                // ĐĂNG NHẬP THÀNH CÔNG
                // ========================================

                window.location.href =
                    "bookings.html";

            }
        );

    }
);