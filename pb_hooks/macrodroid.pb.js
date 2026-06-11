routerAdd("POST", "/api/webhook/macrodroid", (e) => {
    // 1. SEGURIDAD
    const SECRET_TOKEN = "Bearer CoupleWallet2026";
    const authHeader = e.request.header.get("Authorization");

    if (authHeader !== SECRET_TOKEN) {
        return e.json(401, { "error": "Acceso denegado: Token inválido." });
    }

    // 2. EXTRAER TEXTO (Priorizamos leer de la URL)
    let title = e.request.url.query().get("title") || "";
    let text = e.request.url.query().get("text") || "";

    if (!text) {
        const body = new DynamicModel({ title: "", text: "" });
        try { e.bind(body); } catch (err) {}
        if (!title) title = body.title || "";
        text = body.text || "";
    }

    const finalTitle = title || "Pago móvil";

    if (!text) {
        return e.json(400, { "error": "Falta el texto de la notificación." });
    }

    // A. Extracción del importe
    let amount = 0;
    const amountMatch = text.match(/([\d,.]+)\s*[€$]/) || text.match(/(?:de|por)\s+([\d,.]+)/i);
    if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
    }

    if (amount <= 0) {
        return e.json(200, { "message": "Ignorado: No se detectó importe válido." });
    }

    // B. Extraer concepto
    let concept = finalTitle;
    const conceptMatch = text.match(/en\s+(.+?)(?:\.|$)/i) || text.match(/de\s+([A-Za-z0-9 ]+)(?:\.|$)/i);
    if (conceptMatch && conceptMatch[1].length < 35) {
        concept = conceptMatch[1].trim();
    }

    // C. Ingreso vs Gasto
    let type = "EXPENSE";
    const lowerText = text.toLowerCase();
    const lowerTitle = finalTitle.toLowerCase();
    const isIncome = lowerText.includes("ingreso") || lowerText.includes("recibido") ||
                     lowerText.includes("a favor") || lowerText.includes("abono") ||
                     lowerText.includes("devolución") || lowerTitle.includes("recibida") ||
                     lowerText.includes("te ha enviado");

    if (isIncome) { type = "INCOME"; }

    // 3. IDEMPOTENCIA
    const windowMinutes = 5;
    const timeAgo = new Date(Date.now() - windowMinutes * 60000);
    const formattedDate = timeAgo.toISOString().replace('T', ' ').substring(0, 19) + 'Z';

    try {
        const records = $app.findRecordsByFilter(
            "expenses",
            "amount = {:amount} && concept = {:concept} && created >= {:date}",
            "-created",
            1,
            0,
            { "amount": amount, "concept": concept, "date": formattedDate }
        );

        if (records && records.length > 0) {
            console.log("Ignorado: Duplicado detectado para " + concept);
            return e.json(200, { "message": "Ignorado: Gasto ya registrado." });
        }
    } catch (err) { }

    // 4. INSERCIÓN
    try {
        const collection = $app.findCollectionByNameOrId("expenses");
        const record = new Record(collection);

        record.set("amount", amount);
        record.set("concept", concept);
        record.set("date", new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z');
        record.set("status", "MISSING_RECEIPT");
        record.set("type", type);

        $app.save(record);
        console.log(`✅ Nuevo registro: ${type} de ${amount}€ en ${concept}`);
    } catch (dbErr) {
        return e.json(500, { "error": "Fallo al guardar en la BD." });
    }

    return e.json(200, {
        "success": true,
        "message": "Guardado correctamente.",
        "amount": amount
    });
});
