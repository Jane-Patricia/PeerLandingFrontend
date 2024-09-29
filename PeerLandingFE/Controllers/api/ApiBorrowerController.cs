using Microsoft.AspNetCore.Mvc;
using PeerLandingFE.DTO.Req;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace PeerLandingFE.Controllers.api
{
    [Route("Borrower/[controller]/[action]")]
    [ApiController]
    public class ApiBorrowerController : Controller
    {
        private readonly HttpClient _httpClient;
        public ApiBorrowerController(HttpClient httpClient)
        {
            _httpClient = httpClient;
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

        [HttpPost]
        public async Task<IActionResult> AddLoan(ReqAddLoanDTO reqAddLoanDTO)
        {
            if (reqAddLoanDTO == null)
            {
                return BadRequest("Funding can not be null");
            }
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var json = JsonSerializer.Serialize(reqAddLoanDTO);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://localhost:7299/rest/v1/loan/NewLoan", content);

            if (response.IsSuccessStatusCode)
            {
                var jsonData = await response.Content.ReadAsStringAsync();
                return Ok(jsonData);
            }
            else
            {
                return BadRequest("failed to add loan");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetLoans([FromQuery] string idBorrower, [FromQuery]string? status, [FromQuery]string? idLender)
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync($"https://localhost:7299/rest/v1/loan/LoanList?idBorrower={idBorrower}&status={status}&idLender={idLender}");

            Console.WriteLine(response);

            if (response.IsSuccessStatusCode)
            {
                var responseData = await response.Content.ReadAsStringAsync();
                return Ok(responseData);
            }
            else
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                return BadRequest($"Failed to Get Loan Datas: {response.StatusCode} - {errorMessage}");
            }
        }
    }
}
