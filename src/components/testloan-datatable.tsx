


import { useEffect, useState } from "react";

interface TestLoansTableProps {
    
}
interface LoanApplication {
    id: number;
    borrower: {
        first_name: string;
        last_name: string;
    } | null;
    type: string;
    principal_amount: number;
    status: string;
}

export function TestLoansTable(props: TestLoansTableProps) {
    const [loans, setLoans] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("/api/loans", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                console.log("🧪 Test component received data:", data);

                setLoans(data.data || []);
            } catch (error) {
                console.error("🧪 Test component error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-4">Test Loans Table (Found: {loans.length})</h3>
            {loans.length === 0 ? (
                <p>No loans found</p>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Borrower</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((loan) => (
                            <tr key={loan.id} className="border-b">
                                <td className="p-2">#{loan.id}</td>
                                <td className="p-2">
                                    {loan.borrower ? `${loan.borrower.first_name} ${loan.borrower.last_name}` : 'N/A'}
                                </td>
                                <td className="p-2">{loan.type}</td>
                                <td className="p-2">₱{Number(loan.principal_amount).toLocaleString()}</td>
                                <td className="p-2">{loan.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};