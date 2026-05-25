-- Adición de la columna is_refundable a la tabla expenses
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS is_refundable BOOLEAN DEFAULT false;

-- Comentario descriptivo
COMMENT ON COLUMN expenses.is_refundable IS 'Si es true, este gasto no se tiene en cuenta en el balance de deudas mensual y se considera pendiente de reembolso/devolución';
