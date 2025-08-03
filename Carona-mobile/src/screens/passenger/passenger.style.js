export const styles = {
    container: {
        flex: 1
    },
    map: {
        flex: 1,
        width: "100%"
    },
    marker: {
        width: 60,
        height: 60
    },
    
    // Header com título e botão voltar
    header: {
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        zIndex: 1000,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    backButton: {
        backgroundColor: "#F7D600",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },
    backButtonText: {
        fontSize: 18,
        color: "#000",
        fontWeight: "bold"
    },
    headerTitle: {
        fontSize: 18,
        color: "#333",
        fontWeight: "600"
    },
    
    // Container principal
    mainContainer: {
        position: "absolute",
        top: 120,
        left: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    
    // Campo de origem
    originContainer: {
        flexDirection: "row",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    originIconContainer: {
        marginRight: 15,
        alignItems: "center"
    },
    originDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#333",
        marginBottom: 5
    },
    originLine: {
        width: 2,
        height: 30,
        backgroundColor: "#ddd",
        marginBottom: 5
    },
    destinationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F7D600"
    },
    originFieldContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    originTextContainer: {
        flex: 1
    },
    originLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4
    },
    originAddress: {
        fontSize: 16,
        color: "#333",
        flex: 1
    },
    favoriteButton: {
        marginLeft: 10
    },
    favoriteIcon: {
        fontSize: 16,
        color: "#ccc"
    },
    
    // Campo de destino
    destinationContainer: {
        padding: 20
    },
    destinationFieldContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    destinationTextContainer: {
        flex: 1
    },
    destinationLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4
    },
    destinationInput: {
        flex: 1,
        fontSize: 16,
        color: "#666",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#333"
    },
    addStopButton: {
        marginLeft: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#666",
        justifyContent: "center",
        alignItems: "center"
    },
    addStopIcon: {
        fontSize: 18,
        color: "#000",
        fontWeight: "bold"
    },
    
    // Sugestões
    suggestionsContainer: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        maxHeight: 300
    },
    suggestionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    suggestionContent: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    suggestionIcon: {
        fontSize: 16,
        marginRight: 12,
        color: "#333",
        marginTop: 2
    },
    suggestionTextContainer: {
        flex: 1
    },
    suggestionText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
        lineHeight: 20
    },
    suggestionSubText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 18,
        marginTop: 2
    },
    
    // Opções extras
    extraOptionsContainer: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0"
    },
    extraOptionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    extraOptionIcon: {
        fontSize: 16,
        marginRight: 12,
        color: "#999",
        marginTop: 2
    },
    extraOptionText: {
        fontSize: 16,
        color: "#666",
        flex: 1
    },
    

    
    // Botões flutuantes
    confirmButtonContainer: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 9999,
        elevation: 10
    },
    confirmButton: {
        backgroundColor: "#F7D600",
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000"
    },
    cancelButton: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: "#F05656",
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff"
    },
    driverInfo: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    driverLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4
    },
    driverName: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
        marginBottom: 15
    },
    finishButton: {
        backgroundColor: "#ff4444",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center"
    },
    finishButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff"
    },
    
    // Overlay
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: "transparent"
    },
    
    // Loading
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
};

