using Microsoft.AspNetCore.Mvc;

namespace PeerLandingFE.DTO.Req
{
    public class ReqAddLoanDTO
    {
        public string BorrowerId { get; set; }
        public decimal Amount { get; set; }
        public decimal InterestRate { get; set; }
    }
}
