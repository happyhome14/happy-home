// ==========================================
// KẾT NỐI SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://idcsmnlhjnupvrpenlxx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// HÀM ĐỊNH DẠNG TIỀN
// ==========================================

function formatMoney(number) {
    return new Intl.NumberFormat("vi-VN")
        .format(Number(number || 0)) + "đ";
}


// ==========================================
// HÀM ĐỊNH DẠNG NGÀY GIỜ
// ==========================================

function formatDateTime(dateString) {
    if (!dateString) {
        return "";
    }

    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateString));
}


// ==========================================
// CHUẨN HÓA SỐ ĐIỆN THOẠI
// ==========================================

function normalizePhone(phone) {
    return String(phone || "")
        .trim()
        .replace(/\D/g, "");
}


// Tạo các định dạng có thể có của số điện thoại
function getPhoneVariants(phone) {
    const normalizedPhone = normalizePhone(phone);
    const variants = [];

    function addVariant(value) {
        if (value && !variants.includes(value)) {
            variants.push(value);
        }
    }

    addVariant(normalizedPhone);

    // 0981234567
    if (/^0\d{9}$/.test(normalizedPhone)) {
        addVariant("+84" + normalizedPhone.slice(1));
        addVariant("84" + normalizedPhone.slice(1));
    }

    // 84981234567
    if (/^84\d{9}$/.test(normalizedPhone)) {
        addVariant("0" + normalizedPhone.slice(2));
        addVariant("+84" + normalizedPhone.slice(2));
    }

    // +84981234567
    if (/^\+84\d{9}$/.test(normalizedPhone)) {
        addVariant("0" + normalizedPhone.slice(3));
        addVariant("84" + normalizedPhone.slice(3));
    }

    return variants;
}


// ==========================================
// HIỂN THỊ MỘT ĐƠN ĐẶT PHÒNG
// ==========================================

function displayBooking(data) {
    document.getElementById("lookupBookingCode").textContent =
        data.booking_code || "";

    document.getElementById("lookupCustomerName").textContent =
        data.customer_name || "";

    document.getElementById("lookupCustomerPhone").textContent =
        data.customer_phone || "";

    document.getElementById("lookupRoom").textContent =
        (data.room_type || "") +
        " - " +
        (data.room_number || "");

    document.getElementById("lookupGuestNumber").textContent =
        (data.guest_number || 0) + " khách";

    document.getElementById("lookupCheckIn").textContent =
        formatDateTime(data.check_in);

    document.getElementById("lookupCheckOut").textContent =
        formatDateTime(data.check_out);

    document.getElementById("lookupTotalPrice").textContent =
        formatMoney(data.total_price);

    document.getElementById("lookupStatus").textContent =
        data.status || "Chờ xác nhận";

    document.getElementById("lookupResult").style.display =
        "block";

    document.getElementById("lookupResult").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// HIỂN THỊ NHIỀU ĐƠN ĐẶT PHÒNG
// ==========================================

function displayMultipleBookings(bookings) {
    const multipleResult =
        document.getElementById("lookupMultipleResult");

    const bookingList =
        document.getElementById("lookupBookingList");

    if (!multipleResult || !bookingList) {
        return;
    }

    bookingList.innerHTML = "";

    bookings.forEach(function (booking) {
        const item = document.createElement("div");

        item.className = "lookup-booking-item";

        item.innerHTML = `
            <div class="lookup-booking-item-header">
                <strong>
                    Mã đặt phòng:
                    ${booking.booking_code || ""}
                </strong>

                <span>
                    ${booking.status || "Chờ xác nhận"}
                </span>
            </div>

            <div class="lookup-booking-item-grid">
                <div>
                    <span>Khách hàng</span>
                    <strong>
                        ${booking.customer_name || ""}
                    </strong>
                </div>

                <div>
                    <span>Số điện thoại</span>
                    <strong>
                        ${booking.customer_phone || ""}
                    </strong>
                </div>

                <div>
                    <span>Phòng</span>
                    <strong>
                        ${(booking.room_type || "") +
                        " - " +
                        (booking.room_number || "")}
                    </strong>
                </div>

                <div>
                    <span>Số khách</span>
                    <strong>
                        ${(booking.guest_number || 0) + " khách"}
                    </strong>
                </div>

                <div>
                    <span>Nhận phòng</span>
                    <strong>
                        ${formatDateTime(booking.check_in)}
                    </strong>
                </div>

                <div>
                    <span>Trả phòng</span>
                    <strong>
                        ${formatDateTime(booking.check_out)}
                    </strong>
                </div>

                <div>
                    <span>Tổng tiền dự kiến</span>
                    <strong>
                        ${formatMoney(booking.total_price)}
                    </strong>
                </div>
            </div>
        `;

        bookingList.appendChild(item);
    });

    multipleResult.style.display = "block";

    multipleResult.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// HÀM TRA CỨU ĐẶT PHÒNG
// ==========================================

async function lookupBooking() {
    const bookingCodeInput =
        document.getElementById("bookingCode");

    const rawValue =
        bookingCodeInput.value.trim();

    if (!rawValue) {
        alert("Vui lòng nhập mã đặt phòng hoặc số điện thoại.");
        bookingCodeInput.focus();
        return;
    }

    document.getElementById("lookupResult").style.display =
        "none";

    const multipleResult =
        document.getElementById("lookupMultipleResult");

    if (multipleResult) {
        multipleResult.style.display = "none";
    }

    document.getElementById("lookupError").style.display =
        "none";

    try {
        let data = null;
        let error = null;

        const normalizedValue =
            normalizePhone(rawValue);

        // ======================================
        // TRA CỨU BẰNG SỐ ĐIỆN THOẠI
        // ======================================

        // ======================================
// TRA CỨU BẰNG SỐ ĐIỆN THOẠI
// ======================================

if (/^(0\d{9}|84\d{9}|\+84\d{9})$/.test(normalizedValue)) {
    const phoneVariants = getPhoneVariants(normalizedValue);

    let results = [];

    for (const phone of phoneVariants) {
        const result = await supabaseClient
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (result.error) {
            error = result.error;
            break;
        }

        if (result.data && result.data.length > 0) {
            const matchedBookings = result.data.filter(function (booking) {
                const savedPhone = normalizePhone(
                    booking.customer_phone
                );

                return getPhoneVariants(savedPhone).some(function (variant) {
                    return phoneVariants.includes(variant);
                });
            });

            results.push(...matchedBookings);
        }
    }

    // Loại bỏ đơn bị trùng
    const uniqueBookings = [];

    results.forEach(function (booking) {
        const exists = uniqueBookings.some(function (item) {
            return item.booking_code === booking.booking_code;
        });

        if (!exists) {
            uniqueBookings.push(booking);
        }
    });

    data = uniqueBookings;


        } else {
            // ======================================
            // TRA CỨU BẰNG MÃ ĐẶT PHÒNG
            // ======================================

            const result = await supabaseClient
                .from("bookings")
                .select("*")
                .eq("booking_code", rawValue)
                .maybeSingle();

            data = result.data;
            error = result.error;
        }

        // ======================================
        // KIỂM TRA LỖI
        // ======================================

        if (error) {
            console.error("Lỗi tra cứu:", error);

            alert(
                "Có lỗi xảy ra khi tra cứu. Vui lòng thử lại."
            );

            return;
        }

        // ======================================
        // KHÔNG TÌM THẤY ĐƠN
        // ======================================

        if (
            !data ||
            (Array.isArray(data) && data.length === 0)
        ) {
            document.getElementById("lookupError").style.display =
                "block";

            return;
        }

        // ======================================
        // CÓ NHIỀU ĐƠN
        // ======================================

        if (Array.isArray(data)) {
            if (data.length === 1) {
                data = data[0];
            } else {
                displayMultipleBookings(data);
                return;
            }
        }

        // ======================================
        // HIỂN THỊ KẾT QUẢ
        // ======================================

        displayBooking(data);

    } catch (error) {
        console.error("Lỗi:", error);

        alert(
            "Không thể kết nối tới hệ thống. Vui lòng thử lại."
        );
    }
}