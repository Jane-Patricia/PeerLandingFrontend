using Microsoft.AspNetCore.Mvc;
using PeerLandingFE.DTO.Req;
using PeerLandingFE.DTO.Res;
using System.Drawing;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace PeerLandingFE.Controllers.api
{
    [Route("Lender/[controller]/[action]")]
    [ApiController]
    public class ApiLenderController : Controller
    {
        private readonly HttpClient _httpClient;
        public ApiLenderController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetLoans(string? status)
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync("https://localhost:7299/rest/v1/loan/LoanList");

            if (response.IsSuccessStatusCode)
            {
                var responseData = await response.Content.ReadAsStringAsync();
                return Ok(responseData);
            }
            else
            {
                return BadRequest("Failed to Get Loan Datas");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("User ID cannot be null or empty");
            }

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync($"https://localhost:7299/rest/v1/user/UserById?Id={id}");

            if (response.IsSuccessStatusCode)
            {
                var jsonData = await response.Content.ReadAsStringAsync();
                return Ok(jsonData);
            }
            else
            {
                return BadRequest("failed to fetch user");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUserBalance([FromQuery] string id, [FromBody] ReqUpdateBalanceDto reqUpdate)
        {
            if (reqUpdate == null)
            {
                return BadRequest("Balance can not be null");
            }

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);


            var json = JsonSerializer.Serialize(reqUpdate);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"https://localhost:7299/rest/v1/user/UpdateSaldo?id={id}", content);

            if (response.IsSuccessStatusCode)
            {
                var jsonData = await response.Content.ReadAsStringAsync();
                return Ok(jsonData);
            }
            else
            {
                return BadRequest("failed to update balance");
            }
        }


        [HttpPost]
        public async Task<IActionResult> AccFunded([FromBody] ReqAccLoan reqAccLoan)
        {
            try
            {
                if (reqAccLoan == null)
                {
                    return BadRequest("Funding can not be null");
                }
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var json = JsonSerializer.Serialize(reqAccLoan);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://localhost:7299/rest/v1/funding/CreateFunding", content);

                Console.WriteLine(response);
                Console.WriteLine($"LoanId: {reqAccLoan.loanId}, LenderId: {reqAccLoan.lenderId}");

                if (response.IsSuccessStatusCode)
                {
                    var jsonData = await response.Content.ReadAsStringAsync();
                    return Ok(jsonData);
                }
                else
                {
                    return BadRequest("failed to update balance");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
            
        }

        [HttpGet]
        public async Task<IActionResult> RepaymentList(string idLender, string? status, string? borrowerId)
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync($"https://localhost:7299/rest/v1/repayment/ListRepayment?idLender={idLender}&status={status}&borrowerId={borrowerId}");

            if (response.IsSuccessStatusCode)
            {
                var responseData = await response.Content.ReadAsStringAsync();
                return Ok(responseData);
            }
            else
            {
                return BadRequest("Failed to Get Loan Datas");
            }
        }
    }
}
