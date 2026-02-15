import "@testing-library/jest-dom";

// URL.createObjectURL / revokeObjectURL のモック
URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-url");
URL.revokeObjectURL = vi.fn();
